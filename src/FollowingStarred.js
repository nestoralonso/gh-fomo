import React, { useState, useLayoutEffect } from 'react';
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';
import formatDistance from 'date-fns/formatDistance';


const GET_FOLLOWING_STARRED = gql`
query GET_FOLLOWING_STARRED($user: String!, $cursor: String) {
  user(login: $user) {
    following(first: 20, after: $cursor) {
      totalCount
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }

      edges {
        cursor
        node {
          login
          name
          url
          avatarUrl
          starredRepositories(last: 4) {
            edges {
              starredAt
              node {
                nameWithOwner
                description
                url
              }
            }
          }
        }
      }
    }
  }
}
`;

const Repo = React.memo(function Repo({ nameWithOwner, description, starredAt, url }) {
  const [owner, name] = nameWithOwner.split('/');

  return (
    <div className="repo-box">
      <h3><a href={url}>{name}</a></h3>
      <div className="repo-owner">{owner}</div>

      <div className="starred-at">{formatDistance(starredAt, new Date(), { addSuffix: true })}</div>
      <p>
        {description}
      </p>
    </div>
  );
})

const User = React.memo(function User(props) {
  const { starredRepositories: { edges: repos } } = props;

  if (!repos || !repos.length) {
    return null;
  }

  const { name, url } = props;
  let nameSanitized = name;
  const split = url.split('/');
  const userName = split[split.length - 1];

  if (!nameSanitized) {
    nameSanitized = userName;
  }
  const revRepos = repos.slice(0).reverse();
  return (
    <div className="person-with-repos">
      <img className="person-avatar" width="64" height="64" src={props.avatarUrl} alt={nameSanitized} />
      <h2><a href={url}>{nameSanitized}</a> <a className="explore-link" href={`/user?user=${userName}`}>→</a></h2>

      <div className="person-repos">
        {revRepos.map(({ node: repo, starredAt }) =>
          <Repo key={repo.nameWithOwner} starredAt={starredAt} {...repo} />)
        }
      </div>
    </div>
  );
})


const loadMore = ({ fetchMore, user, cursor }) => {
  return fetchMore({
    variables: {
      user,
      cursor
    },
    updateQuery(previousResult, { fetchMoreResult }) {
      const newEdges = fetchMoreResult.user.following.edges;
      const pageInfo = fetchMoreResult.user.following.pageInfo;

      return {
        user: {
          __typename: previousResult.user.__typename,
          following: {
            __typename: previousResult.user.following.__typename,
            totalCount: previousResult.user.following.totalCount,
            edges: [...previousResult.user.following.edges, ...newEdges],
            pageInfo
          }
        }
      };
    }
  });
}


export default function FollowingStarred({ user }) {
  const [scrollY, setScrollY] = useState(0);
  if (!user || !user.trim()) {
    return null;
  }

  useLayoutEffect(() => {
    if (scrollY) {
      setTimeout(() => {
        document.querySelector('html').scrollTop = scrollY;
      }, 1000);
    }
  });

  return (
    <Query
      query={GET_FOLLOWING_STARRED}
      variables={{ user }}
      fetchPolicy="cache-and-network"
    >
      {({ loading, error, data, fetchMore }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error :(</div>;

        const { user: { following: { edges: peopleWithRepos, pageInfo: { hasNextPage, endCursor } } } } = data;

        if (!peopleWithRepos || !peopleWithRepos.length) {
          return null;
        }

        const handleNextPage = () => {
          const scrollY = document.querySelector('html').scrollTop;
          setScrollY(scrollY);
          loadMore({ fetchMore, cursor: endCursor, user });
        };

        return <>
          <div className="people-with-repos">
            {peopleWithRepos.map(({ node }) => <User key={node.login} {...node} />)}
          </div>

          <Pagination
            handleNextPage={handleNextPage}
            hasNextPage={hasNextPage}
          />
        </>
      }}
    </Query>
  )
}

function Pagination({ handleNextPage, hasNextPage }) {
  return (
    <div className="center pagination">
      <button
        onClick={() => {
          handleNextPage();
        }}
        disabled={!hasNextPage}
        className="next"
        type="button"
      >
        Next
        </button>
    </div>
  );
}
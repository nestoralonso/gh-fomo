import React, { Component } from 'react'
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';
import formatDistance from 'date-fns/formatDistance';

const GET_FOLLOWING_STARRED = gql`
query GET_FOLLOWING_STARRED($user: String!, $afterCursor: String) {
  user(login: $user) {
    following(first: 10, after: $afterCursor) {
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
          id
          name
          url
          avatarUrl
          starredRepositories(last: 6) {
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

      <div className="starred-at">{formatDistance(starredAt, new Date(), {addSuffix: true})}</div>
      <p>
        {description}
      </p>
    </div>
  );
})

const User = React.memo(function User(props) {
  const { starredRepositories: { edges: repos } } = props;
  const { name, url } = props;
  let nameSanitized = name;
  if (!nameSanitized) {
    const split = url.split('/');
    nameSanitized = split[split.length - 1];
  }

  return (
    <div className="person-with-repos">
      <img className="person-avatar" width="64" height="64" src={props.avatarUrl} alt={nameSanitized} />
      <h2><a href={url}>{nameSanitized}</a></h2>

      <div className="person-repos">
        {repos.map(({ node: repo, starredAt }) => <Repo key={repo.nameWithOwner} starredAt={starredAt} {...repo} />)}
      </div>
    </div>
  );
})

export default class FollowingStarred extends Component {
  static defaultProps = {
    user: 'mrdoob'
  };

  state = {
    afterCursor: undefined,
    lastAfterCursor: []
  };

  render() {
    const { user } = this.props;
    const { afterCursor, lastAfterCursor } = this.state;

    if (!user || !user.trim()) {
      return null;
    }

    return (
      <Query query={GET_FOLLOWING_STARRED} variables={{ user, afterCursor }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Error :(</div>;

          const { user: { following: { edges: peopleWithRepos, pageInfo: { hasNextPage, hasPreviousPage, endCursor, startCursor } } } } = data;

          if (!peopleWithRepos || !peopleWithRepos.length) {
            return null;
          }

          const handleNextPage = () => {
            this.setState({
              afterCursor: endCursor,
              lastAfterCursor: lastAfterCursor.concat(startCursor)
            })
          };

          console.log('lastAfterCursor', lastAfterCursor);
          const handlePrevPage = () => {
            const newLastCursor = lastAfterCursor.slice(0)
            const last = newLastCursor.pop();
            this.setState({
              afterCursor: last,
              lastAfterCursor: newLastCursor
            })
          };

          return <>
            <Pagination
              handlePrevPage={handlePrevPage}
              handleNextPage={handleNextPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
            />

            <div className="people-with-repos">
              {peopleWithRepos.map(({ node }) => <User key={node.id} {...node} />)}
            </div>

            <Pagination
              handlePrevPage={handlePrevPage}
              handleNextPage={handleNextPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
            />
          </>
        }}
      </Query>
    )
  }
}

function Pagination({ handlePrevPage, handleNextPage, hasNextPage, hasPreviousPage }) {
  return (
    <div className="center">
      <div className="pagination">
        <button
          onClick={handlePrevPage}
          disabled={!hasPreviousPage}
          className="last"
        >
          Prev
        </button>

        <button
          onClick={handleNextPage}
          disabled={!hasNextPage}
          className="next"
        >
          Next
        </button>
      </div>
    </div>
  );
}
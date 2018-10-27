import React, { Component } from 'react'
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';


const GET_FOLLOWING_STARRED = gql`
query GET_FOLLOWING_STARRED($user: String!, $afterCursor: String, $beforeCursor: String) {
  user(login: $user) {
    following(first: 10, after: $afterCursor, before: $beforeCursor) {
      totalCount
      pageInfo {
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
      <div>{owner}</div>
      <div>{starredAt}</div>
      <p>
        {description}
      </p>
    </div>
  );
})

const User = (props) => {
  const { starredRepositories: { edges: repos } } = props;
  const { name, url } = props;
  let nameSanitized = name;
  if (!nameSanitized) {
    const split = url.split('/');
    nameSanitized = split[split.length - 1];
  }

  console.log('>>', { name, url, nameSanitized });
  return (
    <div className="person-with-repos">
      <img className="person-avatar" width="64" height="64" src={props.avatarUrl} alt={nameSanitized} />
      <h2><a href={url}>{nameSanitized}</a></h2>

      <div className="person-repos">
        {repos.map(({ node: repo, starredAt }) => <Repo key={repo.nameWithOwner} starredAt={starredAt} {...repo} />)}
      </div>
    </div>
  );
}

export default class FollowingStarred extends Component {
  static defaultProps = {
    user: 'mrdoob'
  };

  state = {
    afterCursor: undefined,
    beforeCursor: undefined
  };

  render() {
    const { user } = this.props;
    const { afterCursor, beforeCursor } = this.state;

    if (!user || !user.trim()) {
      return null;
    }
    return (
      <Query query={GET_FOLLOWING_STARRED} variables={{ user, afterCursor, beforeCursor }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Error :(</div>;

          const { user: { following: { edges: peopleWithRepos, pageInfo: { hasNextPage, hasPreviousPage } } } } = data;

          if (!peopleWithRepos || !peopleWithRepos.length) {
            return null;
          }

          const handleNextPage = () => {
            const lastIdx = peopleWithRepos.length - 1;
            const cursor = peopleWithRepos[lastIdx].cursor;
            this.setState({
              afterCursor: cursor,
              beforeCursor: undefined
            })
          };

          const handlePrevPage = () => {
            const cursor = peopleWithRepos[0].cursor;
            this.setState({
              afterCursor: undefined,
              beforeCursor: cursor
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
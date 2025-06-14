import gql from "graphql-tag";

export const listItems = gql`
  query ListItems {
    listItems {
      items {
        id
        title
        completed
        createdAt
        updatedAt
      }
    }
  }
`;

export const createItem = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      id
      title
      completed
      createdAt
      updatedAt
    }
  }
`;

export const updateItem = gql`
  mutation UpdateItem($input: UpdateItemInput!) {
    updateItem(input: $input) {
      id
      title
      completed
      updatedAt
    }
  }
`;

export const deleteItem = gql`
  mutation DeleteItem($input: DeleteItemInput!) {
    deleteItem(input: $input) {
      id
    }
  }
`;

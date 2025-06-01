import gql from 'graphql-tag';

export const listTodos = gql`
  query ListTodos {
    listTodos {
      items {
        id
        name
        description
        completed
        createdAt
        updatedAt
      }
    }
  }
`;

export const createTodo = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      name
      description
      completed
      createdAt
      updatedAt
    }
  }
`;

export const updateTodo = gql`
  mutation UpdateTodo($input: UpdateTodoInput!) {
    updateTodo(input: $input) {
      id
      name
      description
      completed
      updatedAt
    }
  }
`;

export const deleteTodo = gql`
  mutation DeleteTodo($input: DeleteTodoInput!) {
    deleteTodo(input: $input) {
      id
    }
  }
`;

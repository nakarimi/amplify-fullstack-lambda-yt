import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

// Configure Amplify
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT as string,
      region: process.env.NEXT_PUBLIC_AWS_REGION as string,
      defaultAuthMode: 'apiKey',
      apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY as string
    }
  }
});

// Create a client
const client = generateClient();

// GraphQL query for fetching todos
export const listTodos = /* GraphQL */ `
  query ListTodos {
    todos {
      id
      title
    }
  }
`;

interface Todo {
  id: string;
  title: string;
}

interface TodoResponse {
  data: {
    todos: Todo[];
  };
}

// Function to fetch todos
export const fetchTodos = async () => {
  try {
    const response = await client.graphql({
      query: listTodos
    }) as TodoResponse;
    return response.data.todos;
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};
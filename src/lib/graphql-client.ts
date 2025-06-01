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

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TodoResponse {
  data: {
    todos: Todo[];
  };
}

interface CreateTodoResponse {
  data: {
    createTodo: Todo;
  };
}

interface UpdateTodoResponse {
  data: {
    updateTodo: Todo;
  };
}

// Function to fetch todos
export const fetchTodos = async () => {
  try {
    console.log('Fetching todos with config:', {
      endpoint: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT,
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      hasApiKey: !!process.env.NEXT_PUBLIC_APPSYNC_API_KEY
    });

    const response = await client.graphql({
      query: /* GraphQL */ `
        query GetTodos {
          todos {
            id
            title
            completed
            createdAt
            updatedAt
          }
        }
      `
    }) as TodoResponse;
    return response.data.todos;
  } catch (error) {
    console.error('Error fetching todos:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
};

// Function to create a todo
export const createNewTodo = async (title: string) => {
  try {
    const response = await client.graphql({
      query: /* GraphQL */ `
        mutation CreateTodo($title: String!) {
          createTodo(title: $title) {
            id
            title
            completed
            createdAt
            updatedAt
          }
        }
      `,
      variables: { 
        title
      }
    }) as CreateTodoResponse;
    return response.data.createTodo;
  } catch (error) {
    console.error('Error creating todo:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// Function to toggle todo completion
export const toggleTodo = async (id: string, completed: boolean) => {
  try {
    const response = await client.graphql({
      query: /* GraphQL */ `
        mutation UpdateTodo($id: ID!, $completed: Boolean!) {
          updateTodo(id: $id, completed: $completed) {
            id
            title
            completed
            updatedAt
          }
        }
      `,
      variables: { 
        id,
        completed
      }
    }) as UpdateTodoResponse;
    return response.data.updateTodo;
  } catch (error) {
    console.error('Error updating todo:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};
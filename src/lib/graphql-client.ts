import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { Observable } from 'rxjs';

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

interface OnCreateTodoResponse {
  data: {
    onCreateTodo: Todo;
  };
}

interface OnUpdateTodoResponse {
  data: {
    onUpdateTodo: Todo;
  };
}

interface DeleteTodoResponse {
  data: {
    deleteTodo: boolean;
  };
}

interface OnDeleteTodoResponse {
  data: {
    onDeleteTodo: boolean;
  };
}

interface SubscriptionHandle {
  unsubscribe: () => void;
  onError: (callback: (error: Error) => void) => void;
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

// Function to subscribe to todo creation
export const subscribeToTodoCreation = (callback: (todo: Todo) => void): SubscriptionHandle => {
  let errorCallback: ((error: Error) => void) | undefined;
  
  const subscription = client.graphql({
    query: /* GraphQL */ `
      subscription OnCreateTodo {
        onCreateTodo {
          id
          title
          completed
          createdAt
          updatedAt
        }
      }
    `
  }) as Observable<OnCreateTodoResponse>;

  const handle = subscription.subscribe({
    next: ({ data }) => {
      callback(data.onCreateTodo);
    },
    error: (error: Error) => {
      console.error('Error in todo creation subscription:', error);
      errorCallback?.(error);
    }
  });

  return {
    unsubscribe: () => handle.unsubscribe(),
    onError: (callback) => {
      errorCallback = callback;
    }
  };
};

// Function to subscribe to todo updates
export const subscribeToTodoUpdates = (callback: (todo: Todo) => void): SubscriptionHandle => {
  let errorCallback: ((error: Error) => void) | undefined;
  
  const subscription = client.graphql({
    query: /* GraphQL */ `
      subscription OnUpdateTodo {
        onUpdateTodo {
          id
          title
          completed
          updatedAt
        }
      }
    `
  }) as Observable<OnUpdateTodoResponse>;

  const handle = subscription.subscribe({
    next: ({ data }) => {
      callback(data.onUpdateTodo);
    },
    error: (error: Error) => {
      console.error('Error in todo update subscription:', error);
      errorCallback?.(error);
    }
  });

  return {
    unsubscribe: () => handle.unsubscribe(),
    onError: (callback) => {
      errorCallback = callback;
    }
  };
};

// Function to delete a todo
export const deleteTodo = async (id: string) => {
  try {
    const response = await client.graphql({
      query: /* GraphQL */ `
        mutation DeleteTodo($id: ID!) {
          deleteTodo(id: $id)
        }
      `,
      variables: { 
        id
      }
    }) as DeleteTodoResponse;
    return response.data.deleteTodo;
  } catch (error) {
    console.error('Error deleting todo:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// Function to subscribe to todo deletion
export const subscribeToTodoDeletion = (callback: (id: string) => void): SubscriptionHandle => {
  let errorCallback: ((error: Error) => void) | undefined;
  
  const subscription = client.graphql({
    query: /* GraphQL */ `
      subscription OnDeleteTodo {
        onDeleteTodo
      }
    `
  }) as Observable<OnDeleteTodoResponse>;

  const handle = subscription.subscribe({
    next: ({ data }) => {
      callback('reload');
    },
    error: (error: Error) => {
      console.error('Error in todo deletion subscription:', error);
      errorCallback?.(error);
    }
  });

  return {
    unsubscribe: () => handle.unsubscribe(),
    onError: (callback) => {
      errorCallback = callback;
    }
  };
};
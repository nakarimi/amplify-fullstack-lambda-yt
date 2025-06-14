import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { Observable } from "rxjs";

// Configure Amplify
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env
        .NEXT_PUBLIC_APPSYNC_ENDPOINT as string,
      region: process.env
        .NEXT_PUBLIC_AWS_REGION as string,
      defaultAuthMode: "apiKey",
      apiKey: process.env
        .NEXT_PUBLIC_APPSYNC_API_KEY as string,
    },
  },
});

// Create a client
const client = generateClient();

interface Item {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ItemResponse {
  data: {
    items: Item[];
  };
}

interface CreateItemResponse {
  data: {
    createItem: Item;
  };
}

interface UpdateItemResponse {
  data: {
    updateItem: Item;
  };
}

interface OnCreateItemResponse {
  data: {
    onCreateItem: Item;
  };
}

interface OnUpdateItemResponse {
  data: {
    onUpdateItem: Item;
  };
}

interface DeleteItemResponse {
  data: {
    deleteItem: boolean;
  };
}

interface OnDeleteItemResponse {
  data: {
    onDeleteItem: boolean;
  };
}

interface SubscriptionHandle {
  unsubscribe: () => void;
  onError: (
    callback: (error: Error) => void
  ) => void;
}

// Function to fetch items
export const fetchItems = async () => {
  try {
    console.log("Fetching items with config:", {
      endpoint:
        process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT,
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      hasApiKey:
        !!process.env.NEXT_PUBLIC_APPSYNC_API_KEY,
    });

    const response = (await client.graphql({
      query: /* GraphQL */ `
        query GetItems {
          items {
            id
            title
            completed
            createdAt
            updatedAt
          }
        }
      `,
    })) as ItemResponse;
    return response.data.items;
  } catch (error) {
    console.error("Error fetching items:", {
      error,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
      stack:
        error instanceof Error
          ? error.stack
          : undefined,
    });
    return [];
  }
};

// Function to create an item
export const createNewItem = async (
  title: string
) => {
  try {
    const response = (await client.graphql({
      query: /* GraphQL */ `
        mutation CreateItem($title: String!) {
          createItem(title: $title) {
            id
            title
            completed
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        title,
      },
    })) as CreateItemResponse;
    return response.data.createItem;
  } catch (error) {
    console.error("Error creating item:", {
      error,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
      stack:
        error instanceof Error
          ? error.stack
          : undefined,
    });
    throw error;
  }
};

// Function to toggle item completion
export const toggleItem = async (
  id: string,
  completed: boolean
) => {
  try {
    const response = (await client.graphql({
      query: /* GraphQL */ `
        mutation UpdateItem($id: ID!, $completed: Boolean!) {
          updateItem(id: $id, completed: $completed) {
            id
            title
            completed
            updatedAt
          }
        }
      `,
      variables: {
        id,
        completed,
      },
    })) as UpdateItemResponse;
    return response.data.updateItem;
  } catch (error) {
    console.error("Error updating item:", {
      error,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
      stack:
        error instanceof Error
          ? error.stack
          : undefined,
    });
    throw error;
  }
};

// Function to delete an item
export const deleteItem = async (id: string) => {
  try {
    const response = (await client.graphql({
      query: /* GraphQL */ `
        mutation DeleteItem($id: ID!) {
          deleteItem(id: $id)
        }
      `,
      variables: {
        id,
      },
    })) as DeleteItemResponse;
    return response.data.deleteItem;
  } catch (error) {
    console.error("Error deleting item:", {
      error,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
      stack:
        error instanceof Error
          ? error.stack
          : undefined,
    });
    throw error;
  }
};

// Subscription for item creation
export const subscribeToItemCreation = (
  callback: (item: Item) => void
): SubscriptionHandle => {
  let errorCallback:
    | ((error: Error) => void)
    | undefined;

  const subscription = client.graphql({
    query: /* GraphQL */ `
      subscription OnCreateItem {
        onCreateItem {
          id
          title
          completed
          createdAt
          updatedAt
        }
      }
    `,
  }) as Observable<OnCreateItemResponse>;

  const handle = subscription.subscribe({
    next: ({ data }) => {
      callback(data.onCreateItem);
    },
    error: (error: Error) => {
      console.error(
        "Error in item creation subscription:",
        error
      );
      errorCallback?.(error);
    },
  });

  return {
    unsubscribe: () => handle.unsubscribe(),
    onError: (callback) => {
      errorCallback = callback;
    },
  };
};

// Subscription for item updates
export const subscribeToItemUpdates = (
  callback: (item: Item) => void
): SubscriptionHandle => {
  let errorCallback:
    | ((error: Error) => void)
    | undefined;

  const subscription = client.graphql({
    query: /* GraphQL */ `
      subscription OnUpdateItem {
        onUpdateItem {
          id
          title
          completed
          updatedAt
        }
      }
    `,
  }) as Observable<OnUpdateItemResponse>;

  const handle = subscription.subscribe({
    next: ({ data }) => {
      callback(data.onUpdateItem);
    },
    error: (error: Error) => {
      console.error(
        "Error in item update subscription:",
        error
      );
      errorCallback?.(error);
    },
  });

  return {
    unsubscribe: () => handle.unsubscribe(),
    onError: (callback) => {
      errorCallback = callback;
    },
  };
};

// Subscription for item deletion
export const subscribeToItemDeletion = (
  callback: (id: string) => void
): SubscriptionHandle => {
  let errorCallback:
    | ((error: Error) => void)
    | undefined;

  const subscription = client.graphql({
    query: /* GraphQL */ `
      subscription OnDeleteItem {
        onDeleteItem
      }
    `,
  }) as Observable<OnDeleteItemResponse>;

  const handle = subscription.subscribe({
    next: () => {
      // Since we're getting a boolean, we need to get the ID from the context
      // For now, we'll just reload all items when a deletion occurs
      callback("reload");
    },
    error: (error: Error) => {
      console.error(
        "Error in item deletion subscription:",
        error
      );
      errorCallback?.(error);
    },
  });

  return {
    unsubscribe: () => handle.unsubscribe(),
    onError: (callback) => {
      errorCallback = callback;
    },
  };
};

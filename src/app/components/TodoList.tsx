"use client";

import { useEffect, useState } from "react";
import {
  fetchItems,
  createNewItem,
  toggleItem,
  deleteItem,
  subscribeToItemCreation,
  subscribeToItemUpdates,
  subscribeToItemDeletion,
} from "@/lib/graphql-client";

interface Item {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function TodoList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<"connected" | "disconnected">("connected");

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      console.error("Error in loadItems:", err);
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();

    // Set up subscriptions
    const createSubscription = subscribeToItemCreation((newItem) => {
      setItems((prevItems) => {
        // Check if item already exists
        if (prevItems.some((item) => item.id === newItem.id)) {
          return prevItems;
        }
        return [...prevItems, newItem];
      });
    });

    const updateSubscription = subscribeToItemUpdates((updatedItem) => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    });

    const deleteSubscription = subscribeToItemDeletion((id) => {
      if (id === "reload") {
        // If we get a reload signal, fetch all items
        loadItems();
      } else {
        setItems((prevItems) =>
          prevItems.filter((item) => item.id !== id)
        );
      }
    });

    // Handle subscription errors
    const handleSubscriptionError = () => {
      setRealtimeStatus("disconnected");
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        setRealtimeStatus("connected");
        loadItems();
      }, 5000);
    };

    createSubscription.onError(handleSubscriptionError);
    updateSubscription.onError(handleSubscriptionError);
    deleteSubscription.onError(handleSubscriptionError);

    // Cleanup subscriptions on unmount
    return () => {
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    };
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    try {
      setError(null);
      const newItem = await createNewItem(newItemTitle);
      setItems((prevItems) => {
        // Check if item already exists
        if (prevItems.some((item) => item.id === newItem.id)) {
          return prevItems;
        }
        return [...prevItems, newItem];
      });
      setNewItemTitle("");
    } catch (err) {
      console.error("Error in handleCreateItem:", err);
      setError(err instanceof Error ? err.message : "Failed to create item");
    }
  };

  const handleToggleItem = async (id: string, completed: boolean) => {
    try {
      setError(null);
      const updatedItem = await toggleItem(id, !completed);
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? updatedItem : item
        )
      );
    } catch (err) {
      console.error("Error in handleToggleItem:", err);
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setError(null);
      await deleteItem(id);
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Error in handleDeleteItem:", err);
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  if (loading)
    return (
      <div className="text-center py-4">
        Loading items...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
        <button
          onClick={loadItems}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Item List
        </h2>
        <div
          className={`flex items-center gap-2 ${realtimeStatus === "connected" ? "text-green-500" : "text-red-500"}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${realtimeStatus === "connected" ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm">
            {realtimeStatus === "connected"
              ? "Real-time connected"
              : "Reconnecting..."}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleCreateItem}
        className="mb-6"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Add new item..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No items found
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleItem(item.id, item.completed)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span
                  className={`${
                    item.completed
                      ? "line-through text-gray-500"
                      : ""
                  }`}
                >
                  {item.title}
                </span>
              </div>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          {items.length} {items.length === 1 ? "item" : "items"} total
        </div>
      )}
    </div>
  );
}

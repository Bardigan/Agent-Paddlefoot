import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || "localhost";

export const useSubmitScore = (token: string | null | undefined) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    score: number,
    options?: {
      onSuccess?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      // Call onSuccess callback if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      // Call onError callback if provided
      if (options?.onError) {
        options.onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, mutate };
};

export const useGetBestScore = (token: string | null | undefined) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getBestScore = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/score/best`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, getBestScore };
};

export const useGetAllBestScores = (token: string | null | undefined) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAllBestScores = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/score/best/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, getAllBestScores };
};

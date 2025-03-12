import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || "localhost";

interface ScoreData {
  id: number;
  score: number;
}

interface UseGetDataReturn {
  data: ScoreData | null;
  loadingGet: boolean | null;
  errorGet: string | null;
  getData: (id?: string) => Promise<void>;
}

export const useGetData = (initialId: string, token: string | null | undefined): UseGetDataReturn => {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loadingGet, setLoadingGet] = useState<boolean | null>(null);
  const [errorGet, setErrorGet] = useState<string | null>(null);

  const getData = async (id: string = initialId): Promise<void> => {
    setLoadingGet(true);
    setErrorGet(null);
    try {
      const response = await fetch(`${API}/score/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const record: ScoreData = await response.json();
      setData(record);
    } catch (error: unknown) {
      setErrorGet((error as Error).message);
    } finally {
      setLoadingGet(false);
    }
  };

  return {
    data,
    loadingGet,
    errorGet,
    getData,
  };
};

interface UsePostDataReturn {
  loadingPost: boolean | null;
  errorPost: string | null;
  postData: (id?: string, newRecord?: number) => Promise<void>;
}

export const usePostData = (initialId: string, token: string | null | undefined): UsePostDataReturn => {
  const [loadingPost, setLoadingPost] = useState<boolean | null>(null);
  const [errorPost, setErrorPost] = useState<string | null>(null);

  const postData = async (id: string = initialId, newRecord?: number): Promise<void> => {
    setLoadingPost(true);
    setErrorPost(null);
    try {
      const response = await fetch(`${API}/score/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: newRecord !== undefined ? JSON.stringify({ score: newRecord.toString() }) : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error: unknown) {
      setErrorPost((error as Error).message);
    } finally {
      setLoadingPost(false);
    }
  };

  return {
    loadingPost,
    errorPost,
    postData,
  };
};

interface UseUpdateDataReturn {
  loadingUpdate: boolean | null;
  errorUpdate: string | null;
  updateData: (id?: string, newRecord?: number) => Promise<void>;
}

export const useUpdateData = (initialId: string, token: string | null | undefined): UseUpdateDataReturn => {
  const [loadingUpdate, setLoadingUpdate] = useState<boolean | null>(null);
  const [errorUpdate, setErrorUpdate] = useState<string | null>(null);

  const updateData = async (id: string = initialId, newRecord?: number): Promise<void> => {
    setLoadingUpdate(true);
    setErrorUpdate(null);
    try {
      const response = await fetch(`${API}/score/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: newRecord !== undefined ? JSON.stringify({ score: newRecord.toString() }) : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error: unknown) {
      setErrorUpdate((error as Error).message);
    } finally {
      setLoadingUpdate(false);
    }
  };

  return {
    loadingUpdate,
    errorUpdate,
    updateData,
  };
};






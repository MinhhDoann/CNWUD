// Chuyển dữ liệu từ localStorage
import { useState, useEffect } from 'react';
import { AppDB } from './types';

const INITIAL_DB: AppDB = { 
  containers: [], 
  cargo: [], 
  transports: [], 
  partners: [],
  staff: [],
  contracts: [],
  invoices: [],
  finance: [],
  vehicles: []
};

export const useDB = () => {
  const [db, setDb] = useState<AppDB>(() => {
    const saved = localStorage.getItem('cl_db');
    return saved ? JSON.parse(saved) : INITIAL_DB;
  });

  const saveDB = (newDB: AppDB) => {
    localStorage.setItem('cl_db', JSON.stringify(newDB));
    setDb(newDB);        // ← tự động cập nhật UI
  };

  return { db, saveDB };
};
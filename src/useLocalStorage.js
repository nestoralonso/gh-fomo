import { useState, useEffect } from 'react';


export default function useLocalStorage(key, initialValue) {
  const [item, setValue] = useState(
    () => window.localStorage.getItem(key) || initialValue
  );
  useEffect(() => {
    window.localStorage.setItem(key, item);
  });
  return [item, setValue];
}
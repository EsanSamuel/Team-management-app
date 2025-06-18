"use client";
import React from "react";

const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    }
    return initialValue;
  });

  const updateValue = (newvalue: T) => {
    setValue(newvalue);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(newvalue));
    }
  };
  return [value, updateValue];
};

export default useLocalStorage;

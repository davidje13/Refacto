import { useLayoutEffect, useContext, createContext } from 'react';

export type TitleHook = (title: string) => void;

const browserTitleSetter: TitleHook = (title: string) => {
  document.title = title;
};

const Context = createContext(browserTitleSetter);

export function useTitle(title: string) {
  const hook = useContext(Context);
  useLayoutEffect(() => {
    hook(title);
  }, [title, hook]);
}

export const TitleContext = Context.Provider;

interface TitleProps {
  title: string;
}

export const Title = ({ title }: TitleProps): null => {
  useTitle(title);
  return null;
};

import type { ReactNode } from "react";

type Props = { children: ReactNode };

const Root = ({ children }: Props) => <section>{children}</section>;

const Title = ({ children }: Props) => <h2>{children}</h2>;

export const Card = { Root, Title };

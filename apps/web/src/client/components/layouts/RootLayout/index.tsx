import { Link, Outlet } from "@tanstack/react-router";

export const RootLayout = () => (
  <>
    <nav>
      <Link to="/">チャット</Link> | <Link to="/about">このアプリについて</Link>
    </nav>
    <Outlet />
  </>
);

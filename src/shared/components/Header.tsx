import { logout, useAuth } from "wasp/client/auth";
import { Link } from "wasp/client/router";
import Logo from "../../assets/wasp-logo-rounded.svg";
import { Button, ButtonLink } from "./Button";

export function Header() {
  const { data: user } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex justify-center border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex w-full max-w-5xl items-center justify-between gap-6 px-[6.18%] py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} alt="ToDo App ロゴ" className="size-10" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            ToDo App
          </h1>
        </Link>
        <nav>
          <ul className="flex items-center gap-3">
            {user ? (
              <li>
                <Button onClick={logout} variant="ghost">
                  ログアウト
                </Button>
              </li>
            ) : (
              <>
                <li>
                  <ButtonLink to="/signup">新規登録</ButtonLink>
                </li>
                <li>
                  <ButtonLink to="/login" variant="ghost">
                    ログイン
                  </ButtonLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

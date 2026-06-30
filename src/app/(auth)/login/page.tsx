import LoginForm from './LoginForm';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const redirect = searchParams.redirect || '/';

  return <LoginForm redirect={redirect} />;
}

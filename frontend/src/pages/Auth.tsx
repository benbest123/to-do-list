import AuthForm from "../components/auth/AuthForm";

function Auth() {
  return (
    <main className="py-10 h-screen space-y-5 overflow-y-auto">
      <h1 className="font-bold text-3xl text-center">Register or Log In</h1>
      <div className="max-w-lg mx-auto bg-slate-100 round-md p-5 space-y-6">
        <AuthForm />
      </div>
    </main>
  );
}

export default Auth;

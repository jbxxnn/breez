export default function TasksLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {children}
      </div>
    );
  } 
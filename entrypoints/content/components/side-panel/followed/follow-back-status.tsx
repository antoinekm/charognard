interface FollowBackStatusProps {
  followedBack: boolean | null;
}

export function FollowBackStatus({ followedBack }: FollowBackStatusProps) {
  if (followedBack === true) {
    return (
      <span className="text-xs text-green-500 whitespace-nowrap">Follows back</span>
    );
  }

  if (followedBack === false) {
    return (
      <span className="text-xs text-red-500 whitespace-nowrap">Not following</span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">Unknown</span>
  );
}

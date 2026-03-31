interface PropsT {
  other: number;
  me: boolean;
}

export const TypingIndicator = ({ other, me }: PropsT) => {
  if (!other) {
    return <p className="typing-indicator" role="note" aria-live="off" />;
  }

  return (
    <p className="typing-indicator active" role="note" aria-live="off">
      {other}
      {me ? ' other' : ''}
      {other === 1 ? ' person is typing\u2026' : ' people are typing\u2026'}
    </p>
  );
};

const formatContestDuration = (minutesValue) => {
  const totalMinutes = Number(minutesValue || 0);

  if (!totalMinutes) return "2h contest";

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let result = "";

  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;

  return result.trim();
};

export default formatContestDuration;
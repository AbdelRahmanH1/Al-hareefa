export const splitFullName = (fullName: string) => {
  const [firstName, ...rest] = fullName.trim().split(' ');
  return {
    firstName,
    lastName: rest.join(' ') || 'N/A',
  };
};

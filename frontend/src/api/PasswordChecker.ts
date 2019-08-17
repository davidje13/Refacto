import sha1 from 'js-sha1';

export default function countPasswordBreaches(password: string): Promise<number> {
  const passwordHash = sha1(password).toUpperCase();
  const key = passwordHash.substr(0, 5);
  const rest = passwordHash.substr(5);
  return fetch(`https://api.pwnedpasswords.com/range/${key}`)
    .then((d) => d.text())
    .then((d) => {
      const lines = d.split('\n');
      return lines.reduce((sum, ln) => {
        const [lnRest, count] = ln.split(':');
        return sum + ((lnRest === rest) ? Number(count) : 0);
      }, 0);
    });
}

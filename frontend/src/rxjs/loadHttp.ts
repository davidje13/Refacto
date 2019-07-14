import { map, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Observable } from 'rxjs';

interface HttpError {
  status: number;
}

function makeHttpError({ status }: HttpError): string {
  if (status >= 500) {
    return `internal error (${status})`;
  }
  if (status === 404) {
    return 'not found';
  }
  if (status >= 400) {
    return `unknown error (${status})`;
  }
  return 'connection failed';
}

export default function loadHttp(url: string): Observable<unknown> {
  return ajax(url).pipe(
    map((data) => data.response),
    catchError((data) => {
      throw makeHttpError(data);
    }),
  );
}

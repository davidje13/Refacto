import { map, catchError } from 'rxjs/operators';
import { ajax, AjaxRequest } from 'rxjs/ajax';
import type { Observable } from 'rxjs';

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

export default function loadHttp<T>(url: string | AjaxRequest): Observable<T> {
  return ajax(url).pipe(
    map((data) => data.response),
    catchError((data) => {
      throw makeHttpError(data);
    }),
  );
}

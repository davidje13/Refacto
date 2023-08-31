import { map, catchError } from 'rxjs/operators';
import { ajax, AjaxConfig } from 'rxjs/ajax';
import { type Observable } from 'rxjs';

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

export function loadHttp<T>(config: AjaxConfig): Observable<T> {
  return ajax(config).pipe(
    map((data) => data.response as T),
    catchError((data) => {
      throw makeHttpError(data);
    }),
  );
}

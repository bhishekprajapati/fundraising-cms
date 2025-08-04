type TErrorOptions = {
  name: string
  message: string
  init?: ResponseInit
}

function err(opts?: TErrorOptions) {
  const { name, message, init } = opts ?? {
    name: 'internal-server-error',
    message: 'something-went-wrong',
    init: {
      status: 500,
    },
  }

  return Response.json(
    {
      ok: false,
      error: {
        name,
        message,
      },
    },
    init,
  )
}

function data(value: unknown, init?: ResponseInit) {
  return Response.json(
    {
      ok: true,
      data: value,
    },
    init,
  )
}

export const api = {
  data,
  err,
}

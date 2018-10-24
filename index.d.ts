namespace Models {
  interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    role: string
  }

  interface Response {
    statusCode: number;
    body?: string | any;
  }
}

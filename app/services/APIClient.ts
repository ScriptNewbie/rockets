interface SuccessResponse<T> {
  total: number;
  last_page: number;
  page: number;
  result: T[];
}

interface ErrorResponse {
  errors: string[];
}

class APIClient<T> {
  private baseUrl: string = process.env.API_URL || "";
  private authKey: string = process.env.API_KEY || "";
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  private http = async (
    searchParams: Record<string, string>
  ): Promise<ErrorResponse | SuccessResponse<T>> => {
    const headers = new Headers({
      Authorization: `Bearer ${this.authKey}`,
      "Content-Type": "application/json",
    });

    const params = new URLSearchParams(searchParams);

    const result = await fetch(`${this.baseUrl}/${this.endpoint}?${params}`, {
      headers,
      next: { revalidate: 10 },
    });

    return result.json();
  };

  get = async (
    searchParams: Record<string, string> = {}
  ): Promise<SuccessResponse<T>> => {
    const response = await this.http(searchParams);

    if ("errors" in response) {
      return { result: [], last_page: 1, total: 0, page: 1 };
    }
    return response;
  };
}

export default APIClient;

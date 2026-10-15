export const AppConfig = {
  get socketUrl(): string {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return 'https://hackeados.api.geislera.com';
  },
};

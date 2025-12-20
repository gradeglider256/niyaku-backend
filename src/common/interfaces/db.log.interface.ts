export interface DatabaseCallLog {
  timestamp: string;
  query: string;
  duration: number;
  file: string;
  line: number;
  function: string;
  module: string;
}

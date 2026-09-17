export interface TableColumn<T> {
  key: Extract<keyof T, string> | string; // string allows virtual keys like 'status' or 'actions'
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

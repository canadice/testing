import { DownloadIcon } from '@chakra-ui/icons';
import { IconButton, Input } from '@chakra-ui/react';
import { ToastContext } from 'contexts/ToastContext';
import { stringify } from 'csv-stringify/sync';
import saveAs from 'file-saver';
import { parse } from 'papaparse';
import { ChangeEvent, useContext } from 'react';

type CSVUploadProps<T> = {
  onDataUpload: (value: T[]) => void;
  expectedHeaders: string[];
  optionalHeaders?: string[];
  label?: string;
};

// Expected Use:
// 1. Create the specific type you're expecting from the CSV.
// type CSVType = Pick<TPEEvent, 'TPEChange' | 'pid'>;

// 2. Set up local state where you're using it.
// const [data, setData] = useState<CSVType[]>([]);

// 3. Use the component with matching types and expected Headers.
// <CSVUpload<CSVType>
//   onDataUpload={setData}
//   expectedHeaders={['TPEChange', 'pid']}
// />;

// 4. Use the data where expected (tables, etc).

const downloadHeadersAsCSV = (
  headers: string[],
  optionalHeaders?: string[],
  label?: string,
): void => {
  const otherHeaders = optionalHeaders ?? [];
  const contents = stringify([[...headers, ...otherHeaders], []]);
  saveAs(
    new Blob([contents], {
      type: 'text/csv;charset=utf-8',
    }),
    `${label ?? 'shl-data'}.csv`,
  );
};

export const CSVUpload = <T,>({
  onDataUpload,
  expectedHeaders,
  optionalHeaders,
  label,
}: CSVUploadProps<T>) => {
  const { addToast } = useContext(ToastContext);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      parse(file, {
        header: true,
        complete: (results) => {
          const uploadedData = results.data as T[];
          const csvHeaders = results.meta.fields || [];

          const mismatchedHeaders = validateHeaders(
            csvHeaders,
            expectedHeaders,
            optionalHeaders,
          );
          if (mismatchedHeaders.length > 0) {
            addToast({
              title: 'Invalid CSV format',
              description: `The uploaded CSV headers do not match the expected format. Mismatched headers: ${mismatchedHeaders.join(
                ', ',
              )}. Expected headers: ${expectedHeaders.join(', ')}`,
              status: 'error',
            });
            return;
          }

          onDataUpload(
            uploadedData.filter(
              (data) =>
                !expectedHeaders.some(
                  (header) => !data[header as keyof typeof data],
                ),
            ),
          );
          addToast({
            title: 'Data uploaded',
            status: 'success',
          });
        },
        error: () => {
          addToast({
            title: 'Error uploading file',
            description: 'An error occurred while processing the file.',
            status: 'error',
          });
        },
      });
    }
  };

  const validateHeaders = (
    csvHeaders: string[],
    expectedHeaders: string[],
    optionalHeaders?: string[],
  ): string[] => {
    const mismatchedHeaders: string[] = [];

    csvHeaders.forEach((header, index) => {
      if (
        header !== expectedHeaders[index] &&
        !optionalHeaders?.includes(header)
      ) {
        mismatchedHeaders.push(header);
      }
    });
    return mismatchedHeaders;
  };

  return (
    <div className="flex flex-nowrap space-x-2">
      <IconButton
        size="sm"
        aria-label="Download Template"
        icon={<DownloadIcon />}
        onClick={() =>
          downloadHeadersAsCSV(expectedHeaders, optionalHeaders, label)
        }
      />

      <Input
        variant="unstyled"
        sx={{
          '::file-selector-button': {
            border: 'none',
            outline: 'none',
          },
        }}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
      />
    </div>
  );
};

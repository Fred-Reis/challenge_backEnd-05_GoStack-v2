import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';

import CreateTransactionService from './CreateTransactionService';
import UploadConfig from '../config/upload';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(fileName: string): Promise<Request[]> {
    const csvFilePath = path.join(UploadConfig.directory, fileName);

    const csv_exists = await fs.promises.stat(csvFilePath);

    if (!csv_exists) {
      throw new AppError('File not found.', 404);
    }

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: Request[] = [];

    const createTransactions = new CreateTransactionService();

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    for (const item of transactions) {
      await createTransactions.execute(item);
    }

    await fs.promises.unlink(csvFilePath);

    return transactions;
  }
}

export default ImportTransactionsService;

import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const newTransactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  const transactions = newTransactions.map(t => ({
    id: t.id,
    type: t.type,
    value: t.value,
    title: t.title,
    created_at: t.created_at,
    updated_at: t.updated_at,
    category: {
      id: t.category.id,
      title: t.category.title,
      created_at: t.category.created_at,
      updated_at: t.category.updated_at,
    },
  }));

  const data = {
    transactions,
    balance,
  };

  return response.json(data);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });

  delete transaction.category_id;
  delete transaction.created_at;
  delete transaction.updated_at;
  delete transaction.category.created_at;
  delete transaction.category.updated_at;

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(
      request.file.filename,
    );

    return response.json(transactions);
  },
);

export default transactionsRouter;

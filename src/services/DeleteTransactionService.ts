import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactionExists = await transactionsRepository.findOne({
      where: { id },
    });

    if (!transactionExists) {
      throw new AppError('Transaction not found.', 401);
    }

    const transactions = await transactionsRepository.remove(transactionExists);

    return transactions;
  }
}

export default DeleteTransactionService;

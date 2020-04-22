import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income = (await this.find())
      .filter(i => i.type === 'income')
      .reduce((a, b) => a + b.value, 0);

    const outcome = (await this.find())
      .filter(o => o.type === 'outcome')
      .reduce((a, b) => a + b.value, 0);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;

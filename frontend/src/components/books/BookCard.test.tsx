/**
 * Component tests for BookCard.
 * Verifies book rendering and the add-to-reading-list interaction.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BookCard from './BookCard';
import type { Book } from '../../types/book';

afterEach(() => {
  cleanup();
});

const book: Book = {
  id: 'book-1',
  title: 'Testboek',
  author: 'Test Auteur',
  description: 'Dit is een testboek.',
  materialType: 'boek',
  level: '2F',
  themes: ['Sport'],
  length: 'SHORT',
};

describe('BookCard', () => {
  it('shows the book information', () => {
    render(<BookCard book={book} />);

    expect(
      screen.getByRole('heading', {
        name: 'Testboek',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Test Auteur'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('2F'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Kort'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Sport'),
    ).toBeInTheDocument();
  });

  it('calls onAdd with the book id when the add button is clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <BookCard
        book={book}
        onAdd={onAdd}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Toevoegen',
      }),
    );

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      'book-1',
    );
  });
});
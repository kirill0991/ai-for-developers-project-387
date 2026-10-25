import { useState, type FormEvent } from 'react';
import { Button, NumberInput, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { createEventType } from '../../../entities/event-type';

interface FormErrors {
  name?: string;
  duration?: string;
}

function validate(name: string, duration: number | string): FormErrors {
  const errors: FormErrors = {};

  if (!name.trim()) {
    errors.name = 'Укажите название';
  }

  if (typeof duration !== 'number' || !Number.isInteger(duration) || duration < 1) {
    errors.duration = 'Укажите длительность — целое число минут больше нуля';
  } else if (duration > 540) {
    errors.duration = 'Не больше 540 минут — это весь рабочий день 09:00–18:00';
  }

  return errors;
}

export function CreateEventType() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number | string>(30);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validate(name, duration);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await createEventType({
        name: name.trim(),
        description: description.trim(),
        duration: Number(duration),
      });
      navigate('/');
    } catch {
      setSubmitting(false);
      setSubmitError('Не удалось создать тип события');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack>
        <TextInput
          label="Название"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          error={errors.name}
        />
        <Textarea
          label="Описание"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
        <NumberInput
          label="Длительность (минуты)"
          description="От 1 до 540 минут — рабочий день 09:00–18:00"
          value={duration}
          onChange={setDuration}
          min={1}
          allowDecimal={false}
          allowNegative={false}
          error={errors.duration}
        />
        {submitError && <Text c="red">{submitError}</Text>}
        <Button type="submit" loading={submitting}>
          Создать
        </Button>
      </Stack>
    </form>
  );
}

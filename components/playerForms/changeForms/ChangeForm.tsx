import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
} from '@chakra-ui/react';
import { Formik, Field, Form } from 'formik';
import { startCase } from 'lodash';
import React from 'react';
import * as Yup from 'yup';

import { ChangeTypes, Position } from '../constants';

const validationSchema = Yup.object().shape({
  newValue: Yup.mixed().when('type', {
    is: (type: ChangeTypes) => ['Render', 'Name'].includes(type),
    then: Yup.string()
      .min(3, 'must be at least 3 characters long')
      .max(80, 'cannot be more than 80 characters long')
      .required('is required'),
    otherwise: Yup.mixed().when('type', {
      is: 'JerseyNumber',
      then: Yup.number()
        .min(0, 'must be between 0 and 99')
        .max(99, 'must be between 0 and 99')
        .required('is required'),
      otherwise: Yup.string()
        .oneOf(
          [
            'Center',
            'Left Defense',
            'Right Defense',
            'Left Wing',
            'Right Wing',
          ],
          'Invalid position',
        )
        .required('is required'),
    }),
  }),
});

export interface ChangeFormValues {
  newValue: string | number;
  type: ChangeTypes;
}

interface ChangeFormProps {
  onCancel: () => void;
  onSubmit: (values: ChangeFormValues) => void;
  isSubmitting: boolean;
  type: ChangeTypes;
  position?: Position;
}

export const ChangeForm = ({
  onCancel,
  onSubmit,
  isSubmitting,
  type,
  position,
}: ChangeFormProps) => {
  const initialValues: ChangeFormValues = {
    newValue: '',
    type,
  };

  const handleSubmit = (values: ChangeFormValues) => {
    onSubmit(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {(props) => (
        <Form>
          <FormControl
            id="newValue"
            isInvalid={Boolean(props.touched && props.errors.newValue)}
          >
            <FormLabel>{`New ${startCase(type)}`}:</FormLabel>
            {type !== 'Position' ? (
              <Field
                as={Input}
                type={
                  ['Render', 'Name', 'Username'].includes(type)
                    ? 'text'
                    : 'number'
                }
                id="newValue"
                name="newValue"
                placeholder={`Enter new ${startCase(type)}`}
              />
            ) : (
              <Field as={Select} id="newValue" name="newValue">
                <option value="">Select Position</option>
                {['Left Defense', 'Right Defense'].includes(position ?? '') && (
                  <>
                    <option value="Center">Center</option>
                    <option value="Left Wing">Left Wing</option>
                    <option value="Right Wing">Right Wing</option>
                  </>
                )}

                {['Center', 'Left Wing', 'Right Wing'].includes(
                  position ?? '',
                ) && (
                  <>
                    <option value="Left Defense">Left Defense</option>
                    <option value="Right Defense">Right Defense</option>
                  </>
                )}
              </Field>
            )}

            <FormErrorMessage>
              {`New ${startCase(type)} ${props.errors.newValue}`}
            </FormErrorMessage>
          </FormControl>

          <div className="my-4 flex items-center">
            <Button
              colorScheme="gray"
              type="button"
              className="mr-2 w-1/2"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              isLoading={isSubmitting}
              isDisabled={!props.dirty}
              type="submit"
              className="w-1/2"
            >
              Submit
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

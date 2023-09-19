import { STARTING_TPE } from 'lib/constants';

export const CREATE_ATTRIBUTE_FORM: AttributeFormFlags = {
  type: 'Create',
  totalTPE: STARTING_TPE,
};

export const UPDATE_ATTRIBUTE_FORM = ({
  totalTPE,
}: {
  totalTPE: number;
}): AttributeFormFlags => ({
  type: 'Update',
  totalTPE,
});

export const REDISTRIBUTE_ATTRIBUTE_FORM = ({
  totalTPE,
}: {
  totalTPE: number;
}): AttributeFormFlags => ({
  type: 'Redistribute',
  totalTPE,
});

export const REGRESSION_ATTRIBUTE_FORM = ({
  totalTPE,
}: {
  totalTPE: number;
}): AttributeFormFlags => ({
  type: 'Regression',
  totalTPE,
});

const ATTRIBUTE_FORM_TYPES = [
  'Create',
  'Update',
  'Redistribute',
  'Regression',
] as const;

export type AttributeFormTypes = (typeof ATTRIBUTE_FORM_TYPES)[number];

export interface AttributeFormFlags {
  type: AttributeFormTypes;
  totalTPE: number;
}

import { CloseIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  Select,
  Tooltip,
  Link as ExternalLink,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from '@chakra-ui/react';
import { PageHeading } from 'components/common/PageHeading';
import { ReactiveNumberInput } from 'components/common/ReactiveNumberInput';
import fuzzysort from 'fuzzysort';
import { debounce, range } from 'lodash';
import { useEffect, useMemo } from 'react';

import { COUNTRIES, PLAYER_INFO_OPTIONS } from './constants';
import {
  CommonCreatePlayerFormProps,
  MAX_PLAYER_HEIGHT_FT,
  MAX_PLAYER_HEIGHT_IN,
  MIN_PLAYER_HEIGHT_FT,
  MIN_PLAYER_HEIGHT_IN,
} from './shared';

export const PlayerInfoForm = ({
  values,
  touched,
  errors,
  handleBlur,
  handleChange,
  setFieldValue,
}: Omit<
  CommonCreatePlayerFormProps,
  'handleSubmit' | 'isSubmitting' | 'isValid' | 'initialValues' | 'resetForm'
>) => {
  useEffect(() => {
    setFieldValue(
      'height',
      `${values.heightFeet ? `${values.heightFeet}ft` : ''} ${
        values.heightInches || values.heightInches === 0
          ? `${values.heightInches}in`
          : ''
      }`.trim(),
    );
  }, [setFieldValue, values.heightFeet, values.heightInches]);

  const shouldShowCustomCountryInput = values.birthCountry === 'Other';

  const findClosestCustomCountryMatch = useMemo(
    () =>
      debounce((country: string) => {
        if (country === '') {
          setFieldValue('iihfNation', 'Unassigned');
        }
        const results = fuzzysort.go(country, COUNTRIES, {
          threshold: 0,
          limit: 1,
        });

        setFieldValue(
          'iihfNation',
          results.length === 0 ? 'Unassigned' : results[0].target,
        );
      }, 200),
    [setFieldValue],
  );

  useEffect(() => {
    if (shouldShowCustomCountryInput) {
      findClosestCustomCountryMatch(values.customBirthCountry ?? '');
    } else {
      setFieldValue('iihfNation', values.birthCountry ?? 'Unassigned');
    }
  }, [
    findClosestCustomCountryMatch,
    setFieldValue,
    shouldShowCustomCountryInput,
    values.birthCountry,
    values.customBirthCountry,
  ]);

  return (
    <>
      <PageHeading>Player Info</PageHeading>
      <div className="mt-2 mb-4 grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6 p-2">
        <FormControl isRequired isInvalid={!!errors.name && touched.name}>
          <FormLabel>Name</FormLabel>
          <Input
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.name}
            name="name"
            placeholder="Your Player's name"
            className="font-mont"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl
          isRequired
          isInvalid={!!errors.position && touched.position}
        >
          <FormLabel>Position</FormLabel>
          <Select
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.position}
            name="position"
            className="font-mont"
          >
            {PLAYER_INFO_OPTIONS.POSITIONS.map((position) => (
              <option value={position} key={`position-select-${position}`}>
                {position}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.position}</FormErrorMessage>
        </FormControl>

        <FormControl
          isRequired
          isInvalid={!!errors.handedness && touched.handedness}
        >
          <FormLabel>Handedness</FormLabel>
          <Select
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.handedness}
            name="handedness"
            className="font-mont"
          >
            {PLAYER_INFO_OPTIONS.HANDEDNESS.map((handed) => (
              <option value={handed} key={`handedness-select-${handed}`}>
                {handed}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.handedness}</FormErrorMessage>
        </FormControl>

        <FormControl
          isRequired
          isInvalid={!!errors.jerseyNumber && touched.jerseyNumber}
        >
          <FormLabel>Jersey Number</FormLabel>
          <ReactiveNumberInput
            label="Jersey Number"
            onBlur={handleBlur}
            onChange={(_, value) =>
              setFieldValue('jerseyNumber', isNaN(value) ? 0 : value)
            }
            value={values.jerseyNumber}
            min={0}
            max={99}
            step={1}
            precision={0}
            className="font-mont"
          />
          <FormErrorMessage>{errors.jerseyNumber}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.render && touched.render}>
          <FormLabel className="flex items-center text-grey800">
            Render{' '}
            <Tooltip
              label="If you would like to declare a real life player (NHL or otherwise) to
          be used as your player's image in media and graphics, enter their
          name here."
              shouldWrapChildren
              placement="top"
            >
              <InfoOutlineIcon className="text-sm !text-grey800" />
            </Tooltip>
          </FormLabel>
          <Input
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.render}
            name="render"
            className="font-mont"
          />
          <FormErrorMessage>{errors.render}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>
            Birthplace{' '}
            <Popover trigger="hover" placement="top">
              <PopoverTrigger>
                <InfoOutlineIcon className="text-sm !text-grey800" />
              </PopoverTrigger>
              <PopoverContent
                bg="gray.700"
                className="!rounded-sm !border-none !py-0.5 !px-2"
              >
                <PopoverBody className="!p-0 text-sm text-grey100">
                  Your choice of birthplace determines your IIHF eligible
                  country. Read the International Recruitment subforum before
                  choosing or{' '}
                  <ExternalLink
                    isExternal
                    className="!underline"
                    href="https://simulationhockey.com/showthread.php?tid=99914"
                  >
                    click here
                  </ExternalLink>
                  .
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </FormLabel>
          <InputGroup>
            <Input
              placeholder="City"
              className="!rounded-r-none font-mont"
              onBlur={handleBlur}
              onChange={handleChange}
              name="birthCity"
              value={values.birthCity}
            />
            {shouldShowCustomCountryInput ? (
              <>
                <Input
                  autoFocus
                  placeholder="Country"
                  className="!rounded-none font-mont"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  name="customBirthCountry"
                  value={values.customBirthCountry}
                />
                <InputRightAddon className="!p-0">
                  <Tooltip
                    label="Return to pre-selected country list"
                    placement="top"
                  >
                    <IconButton
                      className="!rounded-l-none"
                      onClick={() => {
                        setFieldValue('birthCountry', undefined);
                        setFieldValue('customBirthCountry', '');
                      }}
                      aria-label="Return to pre-selected country list"
                      icon={<CloseIcon />}
                    />
                  </Tooltip>
                </InputRightAddon>
              </>
            ) : (
              <Select
                className="!rounded-l-none font-mont"
                onBlur={handleBlur}
                onChange={handleChange}
                name="birthCountry"
                value={values.birthCountry}
                placeholder="Country"
              >
                {PLAYER_INFO_OPTIONS.COUNTRIES.map((country) => (
                  <option value={country} key={`countries-select-${country}`}>
                    {country}
                  </option>
                ))}
              </Select>
            )}
          </InputGroup>
        </FormControl>

        <FormControl
          isRequired
          isInvalid={
            !!errors.height && touched.heightFeet && touched.heightInches
          }
        >
          <FormLabel>Height</FormLabel>
          <InputGroup>
            <Select
              placeholder="Feet"
              className="!rounded-r-none font-mont"
              onChange={handleChange}
              onBlur={handleBlur}
              name="heightFeet"
              value={values.heightFeet}
            >
              {range(MIN_PLAYER_HEIGHT_FT, MAX_PLAYER_HEIGHT_FT + 1).map(
                (feet) => (
                  <option key={`height-feet-select-${feet}`} value={feet}>
                    {feet}ft
                  </option>
                ),
              )}
            </Select>
            <Select
              placeholder="Inches"
              className="!rounded-l-none font-mont"
              onChange={handleChange}
              onBlur={handleBlur}
              name="heightInches"
              value={values.heightInches}
            >
              {range(MIN_PLAYER_HEIGHT_IN, MAX_PLAYER_HEIGHT_IN + 1).map(
                (inches) => (
                  <option key={`height-inches-select-${inches}`} value={inches}>
                    {inches}in
                  </option>
                ),
              )}
            </Select>
          </InputGroup>
          <FormErrorMessage>{errors.height}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.weight && touched.weight}>
          <FormLabel>Weight</FormLabel>
          <ReactiveNumberInput
            label="Weight"
            onBlur={handleBlur}
            onChange={(_, value) =>
              setFieldValue('weight', isNaN(value) ? 0 : value)
            }
            value={values.weight}
            min={150}
            max={300}
            step={1}
            precision={0}
            className="font-mont"
          />
          <FormErrorMessage>{errors.weight}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.recruiter && touched.recruiter}>
          <FormLabel>
            Recruited By{' '}
            <Tooltip
              label="Use this to let us know who referred you to the site. Referring other players can get you bonuses that can help your player grow faster."
              shouldWrapChildren
              placement="top"
            >
              <InfoOutlineIcon className="text-sm !text-grey800" />
            </Tooltip>
          </FormLabel>
          <Input
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.recruiter}
            name="recruiter"
            className="font-mont"
          />
          <FormErrorMessage>{errors.recruiter}</FormErrorMessage>
        </FormControl>
      </div>
    </>
  );
};

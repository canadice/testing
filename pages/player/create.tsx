import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Radio,
    RadioGroup,
    Select,
    Flex,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from '@chakra-ui/react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import AttributeCreate from '../../components/attributes/AttributesCreate';

// Define the list of nationalities (you can get this data from FIFA's list)
const nationalities = [
    "Other",
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Côte d'Ivoire",
    "Democratic Republic of the Congo",
    "Republic of the Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czechia",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "East Timor",
    "England",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Faroe Islands",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Gibraltar",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea, North",
    "Korea, South",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Macedonia",
    "Northern Ireland",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Scotland",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Wales",
    "Yemen",
    "Zambia",
    "Zimbabwe"
];

const PlayerCreationForm: React.FC = () => {
    // Define initial form values
    const initialValues = {
        firstName: '',
        lastName: '',
        discordUsername: '',
        cityOfBirth: '',
        nationality: '',
        height: 65, // Default to 65 inches
        weight: 180, // Default to 180 pounds
        preferredFoot: 'left',
        hairColor: '1',
        hairLength: 'Bald',
        skinTone: 'Skin Tone 10',
        playerType: 'outfield',
    };

    // Define form validation
    const validate = (values: any) => {
        const errors: any = {};
        if (!values.lastName) {
            errors.lastName = 'Last Name is required';
        }
        if (!values.cityOfBirth) {
            errors.cityOfBirth = 'City of Birth is required';
        }
        // Add more validations for other fields
        return errors;
    };

    // Checks input height/weight if it fits within the min/max limits
    const inputCheck = (event) => {
        const { name, value, min, max } = event.target;
        const numericValue = parseInt(value);

        if (numericValue > parseInt(max)) {
            event.target.value = max;
        } else if (numericValue < parseInt(min)) {
            event.target.value = min;
        }
    }

    // Handle form submission
    const handleSubmit = (values: any) => {
        console.log('Form data submitted:', values);
    };

    const [weightValue, setWeightValue] = React.useState(180)
    const handleWeightChange = (weightValue: number) => setWeightValue(weightValue)

    const [heightValue, setHeightValue] = React.useState(62)
    const handleHeightChange = (heightValue: number) => setHeightValue(heightValue)


    const [selectedValue, setSelectedValue] = useState('outfield'); // Default selected value

    const handleChange = (value: string) => {
        setSelectedValue(value);
    };

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={validate}>
            <Form className='px-5'>
                <Box p={4}>
                    <h3>Player Information</h3>
                    <Flex justify="space-between" alignItems="center">
                        <FormControl id="firstName" className='px-5'>
                            <FormLabel>First Name</FormLabel>
                            <Field as={Input} name="firstName" placeholder="First Name" />
                        </FormControl>

                        <FormControl id="lastName" isRequired className='px-5'>
                            <FormLabel>Last Name</FormLabel>
                            <Field as={Input} name="lastName" placeholder="Last Name" />
                        </FormControl>

                        <FormControl id="discordUsername" className='px-5'>
                            <FormLabel>Discord Username</FormLabel>
                            <Field as={Input} name="discordUsername" placeholder="Username" />
                        </FormControl>
                    </Flex>

                    <Flex justify="space-between" alignItems="center" >
                        <FormControl id="cityOfBirth" isRequired className='px-5'>
                            <FormLabel>City of Birth</FormLabel>
                            <Field as={Input} name="cityOfBirth" placeholder="City" />
                        </FormControl>

                        <FormControl id="nationality" isRequired className='px-5'>
                            <FormLabel>Nationality</FormLabel>
                            <Field as={Select} name="nationality">
                                {nationalities.map((nation, index) => (
                                    <option key={index} value={nation}>
                                        {nation}
                                    </option>
                                ))}
                            </Field>
                        </FormControl>
                    </Flex>

                    <Flex justify="space-between" alignItems="center">
                        <FormControl id="height" isRequired className='px-5'>
                            <FormLabel>Height (in inches)</FormLabel>
                            <NumberInput name="height" min={55} max={90} step={1} value={heightValue} onChange={handleHeightChange}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl id="weight" isRequired className='px-5'>
                            <FormLabel>Weight (in pounds)</FormLabel>
                            <NumberInput name="weight" min={100} max={350} step={5} value={weightValue} onChange={handleWeightChange}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl id="preferredFoot" isRequired className='px-5'>
                            <FormLabel>Preferred Foot</FormLabel>
                            <RadioGroup name="preferredFoot" defaultValue="left">
                                <Flex justify="space-around" alignItems="center">
                                    <Flex>
                                        <Field as={Radio} name="preferredFoot" value="left" id="left" />
                                        Left
                                    </Flex>
                                    <Flex>
                                        <Field as={Radio} name="preferredFoot" value="right" id="right" />
                                        Right
                                    </Flex>
                                </Flex>
                            </RadioGroup>
                        </FormControl>

                    </Flex>

                    <h3>Cosmetics</h3>
                    <Flex justify="space-between" alignItems="center">
                        <FormControl id="hairColor" isRequired className='px-5'>
                            <FormLabel>Hair Color</FormLabel>
                            <Field as={Select} name="hairColor">
                                <option value="Light Brown 2">Light Brown</option>
                                <option value="Dark Brown 2">Dark Brown</option>
                                <option value="Black 2">Black</option>
                                <option value="Red 2">Red</option>
                                <option value="Blond(e) 2">Blond(e)</option>
                            </Field>
                        </FormControl>

                        <FormControl id="hairLength" isRequired className='px-5'>
                            <FormLabel>Hair Length</FormLabel>
                            <Field as={Select} name="hairLength">
                                <option value="Bald">Bald</option>
                                <option value="Buzzcut">Buzzcut</option>
                                <option value="Short">Short</option>
                                <option value="Medium">Medium</option>
                                <option value="Long">Long</option>
                            </Field>
                        </FormControl>

                        <FormControl id="skinTone" isRequired className='px-5'>
                            <FormLabel>Skin Tone</FormLabel>
                            <Field as={Select} name="skinTone">
                                <option value="Skin Tone 1">Skin Tone 1 (lightest)</option>
                                <option value="Skin Tone 2">Skin Tone 2</option>
                                <option value="Skin Tone 3">Skin Tone 3</option>
                                <option value="Skin Tone 4">Skin Tone 4</option>
                                <option value="Skin Tone 5">Skin Tone 5</option>
                                <option value="Skin Tone 6">Skin Tone 6</option>
                                <option value="Skin Tone 7">Skin Tone 7</option>
                                <option value="Skin Tone 8">Skin Tone 8</option>
                                <option value="Skin Tone 9">Skin Tone 9</option>
                                <option value="Skin Tone 10">Skin Tone 10</option>
                                <option value="Skin Tone 11">Skin Tone 11</option>
                                <option value="Skin Tone 12">Skin Tone 12</option>
                                <option value="Skin Tone 13">Skin Tone 13</option>
                                <option value="Skin Tone 14">Skin Tone 14</option>
                                <option value="Skin Tone 15">Skin Tone 15</option>
                                <option value="Skin Tone 16">Skin Tone 16</option>
                                <option value="Skin Tone 17">Skin Tone 17</option>
                                <option value="Skin Tone 18">Skin Tone 18</option>
                                <option value="Skin Tone 19">Skin Tone 19</option>
                                <option value="Skin Tone 20">Skin Tone 20 (darkest)</option>
                            </Field>
                        </FormControl>

                    </Flex>

                    <h3>Player Attributes</h3>
                    <FormControl id="playerType" isRequired className='px-5'>
                        <Flex justify="space-around" alignItems="center">
                            <FormLabel>Player Type</FormLabel>
                        </Flex>
                        <RadioGroup name="playerType" defaultValue={selectedValue} onChange={handleChange} className='w-1/2 m-auto'>
                            <Flex justify="space-around" alignItems="center">
                                <Flex>
                                    <Field as={Radio} name="playerType" value="goalkeeper" id="goalkeeper" />
                                    Goalkeeper
                                </Flex>
                                <Flex>
                                    <Field as={Radio} name="playerType" value="outfield" id="outfield" />
                                    Outfield Player
                                </Flex>
                            </Flex>
                        </RadioGroup>
                    </FormControl>

                    <AttributeCreate position={selectedValue} />

                    <Flex justify="space-around" alignItems="center">
                        <Button type="submit" mt={4} colorScheme="blue">
                            Create Player
                        </Button>
                    </Flex>
                </Box>
            </Form>
        </Formik>
    );
};

export default PlayerCreationForm;

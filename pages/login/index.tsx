import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import { Footer } from 'components/common/Footer';
import { Header } from 'components/common/Header';
import { useSession } from 'contexts/AuthContext';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

const validationSchema = Yup.object({}).shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

type FormValues = Yup.InferType<typeof validationSchema>;

export default () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState('');
  const [shouldRevealPassword, setShouldRevealPassword] = useState(false);
  const { loggedIn, handleLogin } = useSession();

  // if logged in, navigate to home

  useEffect(() => {
    if (loggedIn) {
      router.replace('/');
    }
  }, [loggedIn, router]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    isValid,
    handleSubmit,
  } = useFormik<FormValues>({
    validateOnBlur: true,
    validateOnChange: true,
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: ({ username, password }, { setSubmitting }) => {
      setSubmitting(true);
      handleLogin(username, password)
        .then(() => {
          router.push('/');
          setSubmitting(false);
        })
        .catch((error) => {
          const errorMessage =
            'errorMessage' in error
              ? error.errorMessage
              : 'message' in error
              ? error.message
              : "We're having issues, please try again later";
          setLoginError(errorMessage);
          setSubmitting(false);
        });
    },
    validationSchema,
  });

  return (
    <>
      <NextSeo title="Log in" openGraph={{ title: 'Log in' }} />
      <Header showAuthButtons={false} />
      <div className="mx-auto w-full space-y-4 bg-grey100 px-12 py-20 2xl:w-3/5 2xl:px-28">
        <div className="mx-auto flex min-h-[calc(100vh-16rem)] flex-col text-center md:w-3/5">
          <form onSubmit={handleSubmit}>
            <FormControl isInvalid={!!errors.username && touched.username}>
              <FormLabel>Username</FormLabel>
              <Input
                isRequired
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                name="username"
                value={values.username}
                className="font-mont"
                placeholder="Your SHL Username"
              />
              {errors.username && touched.username && (
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid={!!errors.password && touched.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  isRequired
                  type={shouldRevealPassword ? 'text' : 'password'}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="password"
                  value={values.password}
                  className="font-mont"
                  placeholder="Your SHL Password"
                />
                <InputRightElement>
                  <Tooltip
                    label={
                      shouldRevealPassword ? 'Hide Password' : 'Show Password'
                    }
                    placement="top"
                  >
                    <IconButton
                      size="sm"
                      aria-label={
                        shouldRevealPassword ? 'Hide Password' : 'Show Password'
                      }
                      icon={
                        shouldRevealPassword ? <ViewOffIcon /> : <ViewIcon />
                      }
                      onClick={() => setShouldRevealPassword((v) => !v)}
                    />
                  </Tooltip>
                </InputRightElement>
              </InputGroup>
              {errors.password && touched.password && (
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              )}
            </FormControl>

            <Button
              disabled={!isValid}
              type="submit"
              className="mt-6 w-full"
              isLoading={isSubmitting}
              loadingText="Logging In"
            >
              Login
            </Button>
          </form>
          <div className="text-sm">
            <Link
              isExternal
              href="https://simulationhockey.com/member.php?action=lostpw"
              className="font-mont !text-blue600"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="font-mont text-sm">
            Don&apos;t have an account?{' '}
            <Link
              isExternal
              href="https://simulationhockey.com/member.php?action=register"
              className=" !text-blue600"
            >
              Sign up
            </Link>
          </div>
          {loginError && <div className="text-red200">{loginError}</div>}
        </div>
      </div>
      <Footer />
    </>
  );
};

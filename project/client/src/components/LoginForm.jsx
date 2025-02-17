import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client'; // Import Apollo Client's useMutation hook
import { LOGIN_USER } from '../utils/mutations'; // Import the LOGIN_USER mutation
import Auth from '../utils/auth';

const LoginForm = () => {
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Use Apollo Client's mutation hook
  const [login, { error }] = useMutation(LOGIN_USER); // Use LOGIN_USER mutation

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  // Handle form submission (login)
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      // Call the loginUser mutation from Apollo Client
      const { data } = await login({
        variables: { ...userFormData },
      });

      // If login is successful, store the token in local storage and redirect
      const { token } = data.login; // Access token from login mutation response
      Auth.login(token); // Assuming Auth.login stores the token and redirects the user
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    // Clear form fields after submission
    setUserFormData({
      email: '',
      password: '',
    });
  };

  return (
    <>
      {/* Show alert if something goes wrong */}
      <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert || error} variant='danger'>
        Something went wrong with your login credentials!
      </Alert>

      {/* Login Form */}
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>

        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
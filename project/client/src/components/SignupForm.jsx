import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client'; // Import Apollo Client's useMutation hook
import { CREATE_USER } from '../utils/mutations'; // Import the correct GraphQL mutation
import Auth from '../utils/auth';
import { useNavigate } from 'react-router-dom'; // For redirecting after successful signup

const SignupForm = () => {
  // set initial form state
  const [userFormData, setUserFormData] = useState({ username: '', email: '', password: '' });
  // set state for form validation
  const [validated, setValidated] = useState(false);
  // set state for alert
  const [showAlert, setShowAlert] = useState(false);

  // Use Apollo Client's mutation hook
  const [createUser, { error }] = useMutation(CREATE_USER); // Use CREATE_USER mutation
  const navigate = useNavigate(); // For redirecting after successful signup

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
  
    // Perform form validation
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }
    setValidated(true); // Set validated to true to show feedback

    try {
      // Perform the mutation to add the user
      const { data } = await createUser({
        variables: { 
          username: userFormData.username,
          email: userFormData.email,
          password: userFormData.password,
        },
      });
  
      const { token } = data.createUser; // Get the token from the response
      Auth.login(token); // Log the user in with the token
  
      // Redirect to home or other page after successful signup
      navigate('/'); // This will redirect the user to the homepage

    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    // Clear the form after submission
    setUserFormData({
      username: '',
      email: '',
      password: '',
    });
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {/* Show alert if there's an error with the signup */}
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert || error} variant='danger'>
          Something went wrong with your signup!
        </Alert>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='username'>Username</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your username'
            name='username'
            onChange={handleInputChange}
            value={userFormData.username}
            required
          />
          <Form.Control.Feedback type='invalid'>Username is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email address'
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
          disabled={!(userFormData.username && userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
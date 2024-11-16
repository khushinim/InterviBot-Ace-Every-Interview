import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        about: '',
        phoneNumber: '',
        address: '',
        education: '',
        company: '',
        jobTitle: '',
        linkedinProfile: '',
        githubProfile: '',
        profilePicture: '',
        resume: ''
    });

    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [fileInputs, setFileInputs] = useState({
        profilePicture: null,
        resume: null
    });

    const [profilePicturePreview, setProfilePicturePreview] = useState('');

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/auth/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserData(response.data.user);
            setProfilePicturePreview(response.data.user.profilePicture || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage('Failed to load profile. Please try again.');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        setFileInputs(prevInputs => ({ ...prevInputs, [name]: file }));

        if (name === 'profilePicture' && file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveProfilePicture = () => {
        setProfilePicturePreview('');  // Clear the preview image
        setUserData(prevData => ({
            ...prevData,
            profilePicture: ''  // Set profilePicture to an empty string when removed
        }));
        setFileInputs(prevInputs => ({
            ...prevInputs,
            profilePicture: null  // Remove file input reference
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure the profilePicture state reflects the removal if it's cleared
        if (!profilePicturePreview) {
            setUserData(prevData => ({
                ...prevData,
                profilePicture: ''  // Send empty string to remove the picture on backend
            }));
        }
    
        const formData = new FormData();
        for (let key in userData) {
            if (userData[key] !== '') {  // Don't append empty strings (including for profile picture)
                formData.append(key, userData[key]);
            }
        }
    
        // Append profile picture and resume files if they exist
        if (fileInputs.profilePicture) {
            formData.append('profilePicture', fileInputs.profilePicture);
        }
        if (fileInputs.resume) {
            formData.append('resume', fileInputs.resume);
        }
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/auth/profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            // Ensure the updated user data is reflected
            setUserData(response.data.user);
            setProfilePicturePreview(response.data.user.profilePicture || '');  // Update preview
            setMessage('Profile updated successfully');
            setIsEditing(false);
            setFileInputs({ profilePicture: null, resume: null });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Failed to update profile');
        }
    };
    
    

    const toggleEdit = () => {
        if (isEditing) {
            setFileInputs({ profilePicture: null, resume: null });
        }
        setIsEditing(prev => !prev);
    };

    return (
        <div className="container-pro rounded bg-white mt-5 mb-5">
            <div className="profile-header">
                <h1>User Profile</h1>
            </div>
            <div className="profile-body">
                <div className="card-id">
                    <div className="profile-picture">
                        <img
                            src={profilePicturePreview || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                            alt="Profile"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid black',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                            onClick={() => isEditing && document.getElementById('profilePicture').click()}
                        />
                        {isEditing && (
                            <input
                                type="file"
                                id="profilePicture"
                                name="profilePicture"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        )}
                        {isEditing && !profilePicturePreview && (
                            <span 
                                style={{
                                    position: 'absolute',
                                    top: '35%',
                                    left: '65%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '40px',
                                    color: 'gold',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('profilePicture').click()}
                            >
                                +
                            </span>
                        )}
                        {isEditing && profilePicturePreview && (
                            <button 
                                onClick={handleRemoveProfilePicture}
                                style={{
                                    position: 'absolute',
                                    top: '10%',
                                    right: '10%',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    cursor: 'pointer'
                                }}
                            >
                                X
                            </button>
                        )}
                        <div className="about">
                            <h2>{userData.name || 'No Name Provided'}</h2>
                            <p style={{
                                textAlign: 'justify',
                                textAlignLast: 'left',
                                width: '100%',
                                display: 'inline-block',
                                margin: '0'
                            }}>
                                {userData.about || "General information about you will be displayed here."}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="details">
                    <form onSubmit={handleSubmit} className="profile-content">
                        <button type="button" onClick={toggleEdit}>
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                        {isEditing && (
                            <button type="submit">Save Changes</button>
                        )}
                        <label>Name:</label>
                        <input type="text" name="name" value={userData.name || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>Email:</label>
                        <input type="email" name="email" value={userData.email || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>About:</label>
                        <textarea name="about" value={userData.about || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>Phone Number:</label>
                        <input type="text" name="phoneNumber" value={userData.phoneNumber || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>Address:</label>
                        <input type="text" name="address" value={userData.address || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>Education:</label>
                        <input type="text" name="education" value={userData.education || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>Company:</label>
                        <input type="text" name="company" value={userData.company || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>Job Title:</label>
                        <input type="text" name="jobTitle" value={userData.jobTitle || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>LinkedIn Profile:</label>
                        <input type="url" name="linkedinProfile" value={userData.linkedinProfile || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>GitHub Profile:</label>
                        <input type="url" name="githubProfile" value={userData.githubProfile || ''} onChange={handleChange} disabled={!isEditing} />

                        <label>Resume:</label>
                        {isEditing ? (
                            <input type="file" name="resume" onChange={handleFileChange} />
                        ) : (
                            userData.resume ? <a href={userData.resume} target="_blank" rel="noopener noreferrer">Download Resume</a> : <span>No resume uploaded</span>
                        )}
                    </form>
                    {message && <p>{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default Profile;

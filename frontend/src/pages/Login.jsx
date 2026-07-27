const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credenciales)
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                
                // GUARDAMOS EL TOKEN Y LOS DATOS DEL USUARIO
                localStorage.setItem('token', datos.token);
                localStorage.setItem('nombre', datos.usuario.nombre);
                localStorage.setItem('departamento', datos.usuario.departamento);
                localStorage.setItem('rol', datos.usuario.rol);
                
                // Redirigimos al panel principal
                navigate('/dashboard');
            } else {
                const errorData = await respuesta.json();
                setError(errorData.error || 'Credenciales incorrectas.');
            }
        } catch (error) {
            setError('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    };
import inquirer from 'inquirer';
import chalk from 'chalk';

const mainMenu = async () => {
  const options = [
    {
      name: 'Send file',
      value: 'sendFile',
    },
    {
      name: 'Exit',
      value: 'exit',
    },
  ];

  const { selectedOption } = await inquirer.prompt({
    type: 'list',
    name: 'selectedOption',
    message: chalk.blue.bold('CLI Menu'),
    choices: options.map((option) => option.name),
  });

  switch (selectedOption) {
    case 'Send file':
      const { sendFile } = await inquirer.prompt({
        type: 'confirm',
        name: 'sendFile',
        message: 'Send a file? (Y/N):',
        default: false,
      });

      if (sendFile) {
        const { name } = await inquirer.prompt({
          type: 'input',
          name: 'name',
          message: 'Enter your name:',
        });
        console.log(`Hello, ${name}!`);
        // Implement file sending logic here
        console.log('Sending a file...');
      } else {
        console.log('No file sent.');
      }
      mainMenu(); // Return to the main menu
      break;
    case 'Exit':
      console.log('Exiting the CLI menu.');
      return;
  }
};

mainMenu(); // Start the main menu

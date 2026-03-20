UPDATE atendentes SET senha = '$2b$12$bM8a4WsL8JY1imG7gB84/emqpyc3Lij0uILXZHiOCwj1AFOQ0uHpa' WHERE login = 'admin';
UPDATE atendentes SET senha = '$2b$12$ICaEW6UkmcfdLenQe809hOG9CM/Ke/Xb2u0NadJl.tvHSoFRo/S/i' WHERE login = 'atendente01';
UPDATE atendentes SET senha = '$2b$12$k1N2jAA4MlOQ03mGXLm4F..1dw2XaSehM7Sw.iQBqOeVabzC1ksV2' WHERE login = 'atendente02';
SELECT login, SUBSTRING(senha,1,7) as hash_inicio FROM atendentes;

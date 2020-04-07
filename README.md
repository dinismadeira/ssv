# ssv

Automatically get SSV payment documents and send them to IST in order to get the reimbursement.

## This script will automatically:

1. Go to Segurança Social Direta and issue a payment document in the beginning of each month.
1. Go to CGD Homebanking and download the payment statement on the 20th of each month.
1. Send both documents to ssv@cern.tecnico.ulisboa.pt with the required subject every month.

## How to install

1. `git clone https://github.com/dinismadeira/ssv.git`
1. `cd ssv`
1. `npm install`

## How to configure

1. `Edit config.js`

## How to run

1. `node index`

## How to use

The best way is to run the script daily using a cron job or windows scheduler.

On Windows you add a scheduled job to run the command `cmd` with the arguments `/c node index.js >> log.txt 2>&1`. Uncheck the option to to run with privileges, otherwise it won't work.

Notice that this script won't make the payments. You should have direct debit on CGD to pay the SSV.

Once the script is running on a daily job, no input should be needed. However, you may have to perform a `git pull` in case the web sites had changed and I had to update the script. 

CGD's homebanking requests an SMS confirmation from time to time. If the script fails because of this, just log in to check your statements and pass the confirmation screen. The script should work fine the next time.

## Debugging tips

* Set `MAIL_SSV` to `''` in the mail.js module if you don't want to send e-mails.
* Documents are downloaded to `comprovativos` folder. Delete them if you want the script do download them again.
* Whenever an email is sent a line is added to `log.dat`. Delete that line if you want the script to send the e-mail again.
* Set `BROWSER_HEADLESS` to `true` if you don't want to see the browser window when the script runs.
